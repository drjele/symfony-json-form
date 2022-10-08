<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use DateTime;
use Drjele\Symfony\JsonForm\Exception\InvalidValueException;
use Symfony\Contracts\Translation\TranslatorInterface;

class DateElement extends AbstractElement
{
    public const FORMAT_Y_M_D = 'Y-m-d';
    public const FORMAT_M_D_Y = 'm-d-Y';
    public const FORMAT_D_M_Y = 'd-m-Y';
    public const FORMAT_Y_M_D_H_I_S = 'Y-m-d H:i:s';
    public const FORMAT_Y_M_D_H_I = 'Y-m-d H:i';

    public function __construct(
        protected readonly string $name,
        protected readonly string $label,
        protected readonly string $format = self::FORMAT_Y_M_D,
        protected readonly ?string $min = null,
        protected readonly ?string $max = null,
        protected readonly bool $required = true
    ) {
    }

    protected function getType(): string
    {
        return 'date';
    }

    protected function renderElement(mixed $value, ?TranslatorInterface $translator): array
    {
        if (null !== $value && false === \is_string($value) && false === DateTime::createFromFormat($this->format, $value)) {
            throw new InvalidValueException($this->name, $value);
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
