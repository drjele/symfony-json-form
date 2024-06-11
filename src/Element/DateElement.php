<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use DateTime;
use Drjele\Symfony\JsonForm\Element\Contract\AbstractElement;
use Drjele\Symfony\JsonForm\Element\Trait\ReadonlyTrait;
use Drjele\Symfony\JsonForm\Element\Trait\RequiredTrait;
use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

class DateElement extends AbstractElement
{
    use ReadonlyTrait;
    use RequiredTrait;

    public const FORMAT_Y_M_D = 'Y-m-d';
    public const FORMAT_D_M_Y = 'd-m-Y';

    public function __construct(
        string $name,
        string $label,
        protected readonly string $format = self::FORMAT_Y_M_D,
        protected readonly ?string $min = null,
        protected readonly ?string $max = null
    ) {
        parent::__construct($name, $label);
    }

    protected function getType(): string
    {
        return 'date';
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
            'readonly' => $this->readonly,
            'required' => $this->required,
            'value' => $value,
        ];
    }
}
