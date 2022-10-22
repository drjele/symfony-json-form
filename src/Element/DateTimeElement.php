<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use DateTime;
use Drjele\Symfony\JsonForm\Element\Contract\AbstractElement;
use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

class DateTimeElement extends AbstractElement
{
    public const FORMAT_Y_M_D_H_I = 'Y-m-d H:i';
    public const FORMAT_D_M_Y_H_I = 'd-m-Y H:i';

    public function __construct(
        string $name,
        string $label,
        protected readonly string $format = self::FORMAT_Y_M_D_H_I,
        protected readonly ?string $min = null,
        protected readonly ?string $max = null,
        protected readonly bool $required = true
    ) {
        parent::__construct($name, $label);
    }

    protected function getType(): string
    {
        return 'dateTime';
    }

    protected function renderElement(mixed $value): array
    {
        if (null !== $value && false === \is_string($value) && false === DateTime::createFromFormat($this->format, $value)) {
            throw new InvalidValueException($this->getName(), $value);
        }

        return [
            'format' => $this->format,
            'min' => $this->min,
            'max' => $this->max,
            'required' => $this->required,
            'value' => $value,
        ];
    }
}
